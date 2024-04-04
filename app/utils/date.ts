export const nowUTC = () => {
  const date = new Date();

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based in JS
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return formattedDate;
};
