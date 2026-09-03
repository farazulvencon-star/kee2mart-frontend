export const extractJSONFromMarkup = (markupString) => {
    const jsonRegex = /<script type="application\/ld\+json">(.*?)<\/script>/s;
    const match = markupString.match(jsonRegex);
    if (match && match.length >= 2) {
        const extractedJSON = match[1];

        try {
            return JSON.parse(extractedJSON);
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    }

    return null;
};

export const formatDate = (date) => {
  if (!date) return "";

  const d = new Date(date); // Convert string → Date object

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const day = String(d.getDate()).padStart(2, "0");
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${day}, ${month}, ${year}`;   // add commas exactly like your desired format
};
