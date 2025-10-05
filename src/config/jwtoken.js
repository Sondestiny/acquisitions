import jwt from 'jsonwebtoken';
import logger from './logger.js';
import 'dotenv/config';

const SECRET_KEY = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';


const JwToken = {
  signIn : async(payload) => {
    try {
      return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN });
    } catch (error) {
      logger.error('signIn token failed', error);
      throw new Error('signIn token failed' + error);
    }
        
  },
  verify : (token) => {
    try {
      return jwt.verify(token, SECRET_KEY);
    } catch (error) {
      logger.error('JWT verification failed:', error);
      throw new Error('JWT verification failed:' + error);
    }
  }
};
export default JwToken;