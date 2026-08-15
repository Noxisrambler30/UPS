function generateUniqueCode() {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit number
  return `UPS-${year}-${random}`;
}

module.exports = generateUniqueCode;