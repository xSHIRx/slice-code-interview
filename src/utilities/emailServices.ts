import { simulateAsync } from './simulateAsync';

export const sendEmail = async (
  emailAddresses: string[],
  subject: string,
  message: string,
) => {
  await simulateAsync(100);
  console.log(
    `email sent to ${emailAddresses.join(', ')} \ with subject: ${subject} and message: ${message}`,
  );
  return true;
};
