export function titleCase(title: string) {
    let data = title.split('-');
    let newValue = [];
    for (let i of data) {
      newValue.push(i.charAt(0).toUpperCase() + i.slice(1));
    }
    return newValue.join(' ');
  }
  
  export const formatCurrency = (amount: number) => {
    return `৳ ${new Intl.NumberFormat('en-IN').format(amount)}`;
  };
  
  const NUMBER_FORMATTER = new Intl.NumberFormat('en-IN');
  
  export const formatNumber = (number: number) => {
    return NUMBER_FORMATTER.format(number);
  };
  
  const DATE_FORMATTER = new Intl.DateTimeFormat('en-us', {
    dateStyle: 'medium',
  });
  
  export const formatDate = (date: Date) => {
    return DATE_FORMATTER.format(date);
  };
  