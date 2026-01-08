// app/actions.ts
"use server";

import { PrismaClient } from "@prisma/client";

// Mencegah error "Too many connections" saat develop
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// 1. LOGIN / REGISTER OTOMATIS
export async function loginUser(name: string, email: string) {
    // Tentukan role: kalau email mengandung "guru", jadi GURU.
    const role = email.toLowerCase().includes("guru") ? "GURU" : "SISWA";

    // Cek user, kalau belum ada -> buat baru. Kalau ada -> ambil datanya.
    const user = await prisma.user.upsert({
        where: { email: email },
        update: {}, // Kalau sudah ada, biarkan
        create: {
            name,
            email,
            password: "123", // Password default
            role,
        },
    });

    return user;
}

// 2. SIMPAN NILAI (Untuk Siswa)
export async function submitScoreToDB(userId: string, subject: string, day: number, score: number) {
    // Konversi subject string ke Enum Prisma (sesuaikan dengan schema.prisma kamu)
    // Asumsi di schema enumnya: MATEMATIKA, IPA
    const subjectEnum = subject === "MATEMATIKA" ? "MATEMATIKA" : "IPA";

    const newScore = await prisma.score.create({
        data: {
            userId,
            subject: subjectEnum, // Pastikan ini sesuai enum di schema.prisma
            day,
            score,
        },
    });
    return newScore;
}

// 3. AMBIL SEMUA NILAI (Untuk Dashboard Guru)
export async function getAllScores() {
    const scores = await prisma.score.findMany({
        include: {
            user: true, // Sertakan nama siswanya
        },
        orderBy: {
            completedAt: 'desc', // Urutkan dari yang terbaru
        },
    });

    // Kita perlu merapikan datanya biar mudah dibaca di Frontend
    return scores.map(s => ({
        id: s.id,
        studentName: s.user.name,
        subject: s.subject,
        day: s.day,
        score: s.score
    }));
}