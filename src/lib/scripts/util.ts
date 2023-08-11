function generateUID() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function hashEmail(email: string) {
    const hash = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(email));
    return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export { generateUID, hashEmail };