import { Request } from 'express';

export function cookieExtractor(req: Request) {
   let token = null;

   const cookies = req.headers['cookie']?.split('; ').reduce((acc, curr) => {
      const [key, value] = curr.split('=');
      return {
         ...acc,
         [key]: value,
      };
   }, {});

   if (req && cookies) {
      token = cookies['access_token'];
   }
   return token;
}
