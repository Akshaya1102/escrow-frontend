import { ethers } from "ethers";

/**
 * Format Ethereum address to shortened version
 * @param {string} address - Full Ethereum address
 * @param {number} chars - Number of characters to show on each side
 * @returns {string} Formatted address
 */
export function formatAddress(address, chars = 4) {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format ETH amount from wei
 * @param {bigint|string} wei - Amount in wei
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted ETH amount
 */
export function formatEth(wei, decimals = 4) {
  try {
    const eth = ethers.formatEther(wei);
    return parseFloat(eth).toFixed(decimals);
  } catch (error) {
    console.error("Error formatting ETH:", error);
    return "0.0000";
  }
}

/**
 * Parse ETH amount to wei
 * @param {string|number} eth - Amount in ETH
 * @returns {bigint} Amount in wei
 */
export function parseEth(eth) {
  try {
    return ethers.parseEther(eth.toString());
  } catch (error) {
    console.error("Error parsing ETH:", error);
    return 0n;
  }
}

/**
 * Format timestamp to readable date
 * @param {number|bigint} timestamp - Unix timestamp
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} Formatted date
 */
export function formatDate(timestamp, includeTime = false) {
  try {
    const date = new Date(Number(timestamp) * 1000);
    if (includeTime) {
      return date.toLocaleString();
    }
    return date.toLocaleDateString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}

/**
 * Format time remaining until a future timestamp
 * @param {number|bigint} futureTimestamp - Future unix timestamp
 * @returns {string} Time remaining
 */
export function getTimeRemaining(futureTimestamp) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const future = Number(futureTimestamp);
    const diff = future - now;

    if (diff <= 0) {
      return "Time passed";
    }

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  } catch (error) {
    console.error("Error calculating time remaining:", error);
    return "Unknown";
  }
}

/**
 * Validate Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean} Is valid
 */
export function isValidAddress(address) {
  try {
    return ethers.isAddress(address);
  } catch (error) {
    return false;
  }
}

/**
 * Generate IPFS gateway URL
 * @param {string} cid - IPFS CID
 * @param {string} gateway - Gateway URL (default: ipfs.io)
 * @returns {string} Full IPFS URL
 */
export function getIpfsUrl(cid, gateway = "ipfs.io") {
  if (!cid) return "";
  return `https://${gateway}/ipfs/${cid}`;
}

/**
 * Validate IPFS CID format
 * @param {string} cid - CID to validate
 * @returns {boolean} Is valid CID
 */
export function isValidCid(cid) {
  if (!cid || typeof cid !== "string") return false;
  // Basic validation for CIDv0 (Qm...) and CIDv1 (ba...)
  return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|ba[a-z0-9]{57})$/.test(cid);
}

/**
 * Calculate progress percentage
 * @param {number} completed - Completed items
 * @param {number} total - Total items
 * @returns {number} Percentage (0-100)
 */
export function calculateProgress(completed, total) {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy:", error);
    return false;
  }
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Get status color class
 * @param {string} status - Status name
 * @returns {string} Tailwind color classes
 */
export function getStatusColor(status) {
  const colors = {
    active: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    disputed: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
    rejected: "bg-orange-100 text-orange-800",
    released: "bg-emerald-100 text-emerald-800",
    submitted: "bg-purple-100 text-purple-800",
  };
  return colors[status.toLowerCase()] || colors.pending;
}

/**
 * Format large numbers with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  return new Intl.NumberFormat().format(num);
}

/**
 * Check if auto-approve is available
 * @param {number|bigint} submittedAt - Submission timestamp
 * @param {number} autoApprovePeriod - Auto approve period in seconds (default: 7 days)
 * @returns {boolean} Can auto-approve
 */
export function canAutoApprove(submittedAt, autoApprovePeriod = 604800) {
  if (!submittedAt || submittedAt === 0) return false;
  const now = Math.floor(Date.now() / 1000);
  const submitted = Number(submittedAt);
  return now >= submitted + autoApprovePeriod;
}

/**
 * Get error message from contract error
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(error) {
  if (!error) return "Unknown error occurred";

  // Extract revert reason if available
  if (error.reason) return error.reason;
  if (error.message) {
    // Clean up ethers error messages
    if (error.message.includes("user rejected")) {
      return "Transaction was rejected";
    }
    if (error.message.includes("insufficient funds")) {
      return "Insufficient funds for transaction";
    }
    if (error.message.includes("nonce")) {
      return "Transaction nonce error. Please try again.";
    }
    return error.message;
  }

  return "Transaction failed. Please try again.";
}

/**
 * Wait for transaction with confirmation
 * @param {Promise} txPromise - Transaction promise
 * @param {number} confirmations - Number of confirmations to wait for
 * @returns {Promise<Object>} Transaction receipt
 */
export async function waitForTransaction(txPromise, confirmations = 1) {
  try {
    const tx = await txPromise;
    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait(confirmations);
    console.log("Transaction confirmed:", receipt.hash);
    return receipt;
  } catch (error) {
    console.error("Transaction error:", error);
    throw new Error(getErrorMessage(error));
  }
}
