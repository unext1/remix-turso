import {
  Body,
  Text,
  Button,
  Container,
  Heading,
  Html,
  Section,
  Row,
  Column,
  Head,
  Tailwind,
  Img,
  render
} from '@react-email/components';

export const EmailTemplate = () => {
  return (
    <Html className="bg-gray-50 h-screen flex justify-center items-center">
      {/* <Tailwind> */}
      <Head />
      <Body className="bg-white shadow-xl p-8 rounded max-w-md">
        <Container className="container my-8 mx-auto text-center text-black">
          <Section className="">
            <Text className="text-red-400">
              <strong>Lauva.Dev</strong>
            </Text>
          </Section>

          <Section>
            <Button className="mt-4">
              <strong>View On Site</strong>
            </Button>
          </Section>
        </Container>
      </Body>
      {/* </Tailwind> */}
    </Html>
  );
};

// TO TEST!!:::
// const aa = () => {
//   const html = render(<EmailTemplate />);
//   console.log(html);
// };

// aa();
// npx tsx ./app/services/send-email.server.tsx
