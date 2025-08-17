/**
 * Validates if a string is a valid IPv4 address
 */
export function isValidIPv4(ip: string): boolean {
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(ip);
  }
  
  /**
   * Validates if a string is a valid IPv6 address
   */
  export function isValidIPv6(ip: string): boolean {
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    return ipv6Regex.test(ip);
  }
  
  /**
   * Validates if a string is a valid IP address (IPv4 or IPv6)
   */
  export function isValidIP(ip: string): boolean {
    return isValidIPv4(ip) || isValidIPv6(ip);
  }
  
  /**
   * Reverses an IPv4 address
   * Example: 192.168.1.1 -> 1.1.168.192
   */
  export function reverseIPv4(ip: string): string {
    if (!isValidIPv4(ip)) {
      throw new Error('Invalid IPv4 address');
    }
    
    return ip.split('.').reverse().join('.');
  }
  
  /**
   * Reverses an IPv6 address by reversing the order of groups
   * Example: 2001:0db8:85a3:0000:0000:8a2e:0370:7334 -> 7334:0370:8a2e:0000:0000:85a3:0db8:2001
   */
  export function reverseIPv6(ip: string): string {
    if (!isValidIPv6(ip)) {
      throw new Error('Invalid IPv6 address');
    }
    
    // Expand the IPv6 address to full form first
    const expandedIP = expandIPv6(ip);
    
    // Split by colons and reverse
    return expandedIP.split(':').reverse().join(':');
  }
  
  /**
   * Expands a compressed IPv6 address to its full form
   */
  function expandIPv6(ip: string): string {
    // Handle :: compression
    if (ip.includes('::')) {
      const parts = ip.split('::');
      const leftPart = parts[0] ? parts[0].split(':') : [];
      const rightPart = parts[1] ? parts[1].split(':') : [];
      
      const totalGroups = 8;
      const missingGroups = totalGroups - leftPart.length - rightPart.length;
      const zeroGroups = Array(missingGroups).fill('0000');
      
      const fullParts = [...leftPart, ...zeroGroups, ...rightPart];
      ip = fullParts.join(':');
    }
    
    // Pad each group to 4 characters
    return ip.split(':').map(group => group.padStart(4, '0')).join(':');
  }
  
  /**
   * Reverses any valid IP address (IPv4 or IPv6)
   */
  export function reverseIP(ip: string): string {
    if (isValidIPv4(ip)) {
      return reverseIPv4(ip);
    } else if (isValidIPv6(ip)) {
      return reverseIPv6(ip);
    } else {
      throw new Error('Invalid IP address format');
    }
  }
  
  /**
   * Extracts the real client IP from request headers
   * Handles proxy headers and forwarded IPs
   */
  export function extractClientIP(req: any): string {
    const forwarded = req.headers['x-forwarded-for'];
    const realIP = req.headers['x-real-ip'];
    const clientIP = req.connection?.remoteAddress || req.socket?.remoteAddress;
    
    // Priority: x-forwarded-for -> x-real-ip -> connection IP
    if (forwarded) {
      // x-forwarded-for can be a comma-separated list, take the first one
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    // Remove IPv6 prefix if present (::ffff:192.168.1.1 -> 192.168.1.1)
    if (clientIP && clientIP.startsWith('::ffff:')) {
      return clientIP.substring(7);
    }
    
    return clientIP || 'unknown';
  }
  
  /**
   * Normalizes an IP address (removes IPv6 prefix if IPv4-mapped)
   */
  export function normalizeIP(ip: string): string {
    if (ip.startsWith('::ffff:')) {
      return ip.substring(7);
    }
    return ip;
  }