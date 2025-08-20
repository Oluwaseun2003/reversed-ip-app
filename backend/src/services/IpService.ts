import { PrismaClient } from '@prisma/client';
import { reverseIP, extractClientIP, normalizeIP } from '../utils/IpUtils.js';
import type { IPHistoryEntry } from '../types/index.js';

const prisma = new PrismaClient();

export class IPService {
  async reverseAndStore(
    originalIP: string,
    req: any
  ): Promise<{
    id: string;
    originalIP: string;
    reversedIP: string;
    requestIP: string;
    timestamp: Date;
    userAgent: string | null;
    createdAt: Date;
  }> {
    // Reverse the IP address
    const reversedIP = reverseIP(originalIP);

    // Extract client IP from request, fallback to 'unknown' if null
    const requestIP = normalizeIP(extractClientIP(req)) || 'unknown';
    const userAgent = req.headers['user-agent'] || null;

    // Store in database
    const result = await prisma.reversedIP.create({
      data: {
        originalIP,
        reversedIP,
        requestIP,
        userAgent,
      },
      select: {
        id: true,
        originalIP: true,
        reversedIP: true,
        requestIP: true,
        userAgent: true,   
        createdAt: true,
        timestamp: true,
      },
    });

    // Ensure requestIP is always a string (never null)
    if (result.requestIP === null) {
      result.requestIP = 'unknown';
    }

    // Type assertion to satisfy return type (requestIP is now string)
    return result as {
      id: string;
      originalIP: string;
      reversedIP: string;
      requestIP: string;
      timestamp: Date;
      userAgent: string | null;
      createdAt: Date;
    };
  }

  /**
   * Get paginated history of reversed IPs
   */
  async getHistory(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    entries: IPHistoryEntry[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      prisma.reversedIP.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          originalIP: true,
          reversedIP: true,
          requestIP: true,
          userAgent: true,
          timestamp: true,
          createdAt: true,
        },
      }),
      prisma.reversedIP.count(),
    ]);

    return {
      entries: entries.map((entry) => ({
        id: entry.id,
        originalIP: entry.originalIP,
        reversedIP: entry.reversedIP,
        requestIP: entry.requestIP,
        userAgent: entry.userAgent,
        timestamp: entry.timestamp.toISOString(),
        createdAt: entry.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  /**
   * Get statistics about stored IPs
   */
  async getStats(): Promise<{
    totalEntries: number;
    uniqueIPs: number;
    todayEntries: number;
    topRequestIPs: { ip: string; count: number }[];
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalEntries, uniqueOriginalIPs, todayEntries, topRequestIPs] = await Promise.all([
      prisma.reversedIP.count(),
      prisma.reversedIP.findMany({
        select: { originalIP: true },
        distinct: ['originalIP'],
      }),
      prisma.reversedIP.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
      prisma.reversedIP.groupBy({
        by: ['requestIP'],
        _count: {
          requestIP: true,
        },
        orderBy: {
          _count: {
            requestIP: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    return {
      totalEntries,
      uniqueIPs: uniqueOriginalIPs.length,
      todayEntries,
      topRequestIPs: topRequestIPs.map((item) => ({
        ip: item.requestIP!,
        count: item._count!.requestIP,
      })),
    };
  }

  /**
   * Search for IPs by original or reversed IP
   */
  async searchIPs(query: string, limit: number = 10): Promise<IPHistoryEntry[]> {
    const results = await prisma.reversedIP.findMany({
      where: {
        OR: [
          {
            originalIP: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            reversedIP: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            requestIP: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        originalIP: true,
        reversedIP: true,
        requestIP: true,
        userAgent: true,
        timestamp: true,
        createdAt: true,
      },
    });

    return results.map((entry) => ({
      id: entry.id,
      originalIP: entry.originalIP,
      reversedIP: entry.reversedIP,
      requestIP: entry.requestIP,
      userAgent: entry.userAgent,
      timestamp: entry.timestamp.toISOString(),
      createdAt: entry.createdAt.toISOString(),
    }));
  }

  /**
   * Health check - test database connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Clean up - disconnect from database
   */
  async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}

export const ipService = new IPService();