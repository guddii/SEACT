export const isSuccessfulResponse = (response: Response): boolean => {
  return response.status >= 200 && response.status < 300;
};

export const isRedirectionMessage = (response: Response): boolean => {
  return response.status >= 300 && response.status < 400;
};
