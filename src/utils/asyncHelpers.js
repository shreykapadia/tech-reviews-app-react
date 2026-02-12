export const withTimeout = (promise, timeoutMs = 15000) => {
    let timeoutHandle;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => reject(new Error('Operation timed out')), timeoutMs);
    });

    return Promise.race([
        promise.then(res => { clearTimeout(timeoutHandle); return res; }),
        timeoutPromise
    ]);
};

export const retryOperation = async (operation, maxRetries = 2, delayMs = 1000) => {
    let lastError;
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            console.warn(`Operation failed (attempt ${i + 1}/${maxRetries + 1}):`, error);
            if (i < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
    }
    throw lastError;
};
