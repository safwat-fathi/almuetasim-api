import { Request, Response, NextFunction } from 'express';
import CONSTANTS from 'src/common/constants';

function validateContentLength(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const contentLength = req.headers['content-length'];

  if (contentLength && Number(contentLength) > CONSTANTS.FILE.MAX_FILE_SIZE) {
    return res.status(413).json({
      message: `File too large. Max allowed size is ${CONSTANTS.FILE.MAX_FILE_SIZE / (1024 * 1024)}MB`,
    });
  }

  next();
}

export default validateContentLength;
