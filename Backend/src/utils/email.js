import { Resend } from 'resend';
import sgMail from '@sendgrid/mail';
import dayjs from 'dayjs';
import AppError from './AppError.js';
import { AuthErrorCodes } from '../modules/auth/auth.constants.js';

const buildContent = ({ friendlyName, verifyUrl, expiresLabel, metaDetails, code }) => {
    const text = [
        `Hi ${friendlyName},`,
        '',
        'Please verify your email to activate your Hackract account.',
        code ? `Verification code: ${code}` : null,
        verifyUrl ? `Or use the link: ${verifyUrl}` : null,
        '',
        expiresLabel ? `This link expires on ${expiresLabel}.` : 'This link will expire soon.',
        '',
        metaDetails ? `Request details: ${metaDetails}` : null,
        'If you did not request this, you can ignore this email.',
    ]
        .filter(Boolean)
        .join('\n');

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
            <p>Hi ${friendlyName},</p>
            <p>Please verify your email to activate your Hackract account.</p>
            ${code ? `<p style="font-size: 24px; letter-spacing: 8px; font-weight: bold;">${code}</p>` : ''}
            ${verifyUrl ? `<p><a href="${verifyUrl}" style="background: #111827; color: #10b981; padding: 10px 16px; text-decoration: none; border-radius: 6px;">Verify email</a></p>` : ''}
            ${verifyUrl ? `<p>Or copy and paste this link: <br /><span style="word-break: break-all;">${verifyUrl}</span></p>` : ''}
            <p>${expiresLabel ? `This code expires on ${expiresLabel}.` : 'This code will expire soon.'}</p>
            ${metaDetails ? `<p style="color:#6b7280; font-size: 12px;">Request details: ${metaDetails}</p>` : ''}
            <p style="color:#6b7280; font-size: 12px;">If you did not request this, you can ignore this email.</p>
        </div>
    `;

    return { text, html };
};

const getProviders = () => {
    const providers = [];

    if (process.env.RESEND_API_KEY && process.env.RESEND_FROM) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        providers.push({
            name: 'Resend',
            send: (payload) => resend.emails.send({ ...payload, from: process.env.RESEND_FROM }),
        });
    }

    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        providers.push({
            name: 'SendGrid',
            send: (payload) => sgMail.send({ ...payload, from: process.env.SENDGRID_FROM }),
        });
    }

    if (providers.length === 0) {
        throw new AppError(
            'Email is not configured. Please contact support.',
            500,
            AuthErrorCodes.EMAIL_DELIVERY_FAILED
        );
    }

    return providers;
};

export const sendVerificationEmail = async ({ to, name, verifyUrl, code, expiresAt, ipAddress, userAgent }) => {
    const providers = getProviders();

    const friendlyName = name || 'there';
    const expiresLabel = expiresAt ? dayjs(expiresAt).format('MMM D, YYYY h:mm A Z') : null;
    const metaDetails = [ipAddress && `IP: ${ipAddress}`, userAgent && `Client: ${userAgent}`]
        .filter(Boolean)
        .join(' | ');

    const { text, html } = buildContent({ friendlyName, verifyUrl, expiresLabel, metaDetails, code });

    let lastError = null;
    for (const provider of providers) {
        try {
            await provider.send({ to, subject: 'Verify your email', text, html });
            return; // success
        } catch (error) {
            console.error(`${provider.name} error`, error);
            lastError = error;
        }
    }

    throw new AppError(
        'We could not send the verification email. Please try again later.',
        500,
        AuthErrorCodes.EMAIL_DELIVERY_FAILED,
        lastError?.message ? { reason: lastError.message } : null
    );
};

export const sendPasswordResetEmail = async ({ to, name, resetUrl, expiresAt, ipAddress, userAgent }) => {
    const providers = getProviders();

    const friendlyName = name || 'there';
    const expiresLabel = expiresAt ? dayjs(expiresAt).format('MMM D, YYYY h:mm A Z') : null;
    const metaDetails = [ipAddress && `IP: ${ipAddress}`, userAgent && `Client: ${userAgent}`]
        .filter(Boolean)
        .join(' | ');

    const text = [
        `Hi ${friendlyName},`,
        '',
        'You requested a password reset for your Hackract account.',
        resetUrl ? `Reset link: ${resetUrl}` : null,
        '',
        expiresLabel ? `This link expires on ${expiresLabel}.` : 'This link will expire soon.',
        '',
        metaDetails ? `Request details: ${metaDetails}` : null,
        'If you did not request this, you can ignore this email.',
    ]
        .filter(Boolean)
        .join('\n');

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
            <p>Hi ${friendlyName},</p>
            <p>You requested a password reset for your Hackract account.</p>
            ${resetUrl ? `<p><a href="${resetUrl}" style="background: #111827; color: #10b981; padding: 10px 16px; text-decoration: none; border-radius: 6px;">Reset password</a></p>` : ''}
            ${resetUrl ? `<p>Or copy and paste this link: <br /><span style="word-break: break-all;">${resetUrl}</span></p>` : ''}
            <p>${expiresLabel ? `This link expires on ${expiresLabel}.` : 'This link will expire soon.'}</p>
            ${metaDetails ? `<p style="color:#6b7280; font-size: 12px;">Request details: ${metaDetails}</p>` : ''}
            <p style="color:#6b7280; font-size: 12px;">If you did not request this, you can ignore this email.</p>
        </div>
    `;

    let lastError = null;
    for (const provider of providers) {
        try {
            await provider.send({ to, subject: 'Reset your password', text, html });
            return;
        } catch (error) {
            console.error(`${provider.name} error`, error);
            lastError = error;
        }
    }

    throw new AppError(
        'We could not send the reset email. Please try again later.',
        500,
        AuthErrorCodes.EMAIL_DELIVERY_FAILED,
        lastError?.message ? { reason: lastError.message } : null
    );
};
