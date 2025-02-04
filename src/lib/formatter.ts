export function titleCase(title: string) {
  const data = title.split("-");
  const newValue = [];
  for (const i of data) {
    newValue.push(i.charAt(0).toUpperCase() + i.slice(1));
  }
  return newValue.join(" ");
}

export const formatCurrency = (amount: number) => {
  return `৳ ${new Intl.NumberFormat("en-IN").format(amount)}`;
};

const NUMBER_FORMATTER = new Intl.NumberFormat("en-IN");

export const formatNumber = (number: number) => {
  return NUMBER_FORMATTER.format(number);
};

const DATE_FORMATTER = new Intl.DateTimeFormat("en-us", {
  dateStyle: "long",
});

export const formatDate = (date: Date) => {
  return DATE_FORMATTER.format(date);
};
