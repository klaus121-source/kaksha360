import express from 'express'
import { Register, VerifyEmail, login, ForgotPassword, ResetPassword } from '../controllers/Auth.js';

const AuthRoutes=express.Router()

AuthRoutes.post('/register', Register);
AuthRoutes.post('/verifyEmail', VerifyEmail)
AuthRoutes.post('/login', login)
AuthRoutes.post('/forgot-password', ForgotPassword)
AuthRoutes.post('/reset-password', ResetPassword)
export default AuthRoutes