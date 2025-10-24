// generate unique identifier dengan format: R + timestamp + random letters
export const generateReceiptId = () => {
    const timestamp = Date.now().toString().slice(-6); // ambil 6 digit terakhir timestamp
    const randomLetters = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3 random letters uppercase
    return `R${timestamp}${randomLetters}`;
};

// generate unique identifier dengan format custom
export const generateUniqueId = (prefix = 'ID', length = 8) => {
    const timestamp = Date.now().toString().slice(-4); // ambil 4 digit terakhir timestamp
    const randomString = Math.random().toString(36).substring(2, length - 3).toUpperCase();
    return `${prefix}${timestamp}${randomString}`;
};
