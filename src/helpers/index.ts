export const makeHash = () => Math.random().toString(36).slice(-9);

export const updateArray = (s: any[], d: any, k: string) => {
  const foundIndex = s.findIndex((o: any) => o[k] === d[k]);
  const temp = [...s];
  if (foundIndex > -1) {
    temp.splice(foundIndex, 1, { ...s[foundIndex], ...d });
  }
  return temp;
};
