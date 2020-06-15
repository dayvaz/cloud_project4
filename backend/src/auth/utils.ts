import { decode } from 'jsonwebtoken'

import { JwtPayload } from './JwtPayload'
import { Jwt } from './Jwt'

import * as jwksClient from "jwks-rsa";

const client = jwksClient({ jwksUri: process.env.AUTH0_JWK_URL});
/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}

export async function getSigningKey(jwt: Jwt): Promise<jwksClient.SigningKey> {
  return new Promise((resolve, reject) => {

      client.getSigningKey(jwt.header.kid, (err: Error, key: jwksClient.SigningKey) => {
          if (err) {
              return reject(err);
          }

          resolve(key);
      });
  });
}
