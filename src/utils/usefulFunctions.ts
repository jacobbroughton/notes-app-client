export function isValidColor(strColor: string | undefined): boolean {
  if (!strColor) return false;

  const s = new Option().style;
  s.color = strColor;
  return s.color !== "";
}

export function isValidTagName(strName: string, canBeEmpty: boolean) {
  if (canBeEmpty) return true;
  return strName !== "";
}
