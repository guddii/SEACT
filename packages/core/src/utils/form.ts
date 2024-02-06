export const STORAGE = "storage";

export const getStorageFromForm = async (req: Request): Promise<string> => {
  const formData = await req.formData();
  return String(formData.get(STORAGE));
};

export const setValuesToForm = (values: Record<string, string>): FormData => {
  const formData = new FormData();
  Object.entries(values).forEach(([name, value]) => {
    formData.append(name, value);
  });
  return formData;
};
