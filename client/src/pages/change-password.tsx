import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import { useRouter } from 'next/router';
import { useState } from 'react';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { ChangePasswordInput, useChangePasswordMutation } from '../generated/graphql';
import { mapFieldErrors } from '../helpers/mapFieldErrors';
import NextLink from 'next/link';

const ChangePassword = () => {
  const { query } = useRouter();

  const initialValues = { newPassword: '' };

  const [changePassword, { loading }] = useChangePasswordMutation();

  const [tokenError, setTokenError] = useState('');

  const onChangePasswordSubmit = async (
    values: ChangePasswordInput,
    { setErrors }: FormikHelpers<ChangePasswordInput>
  ) => {
    if (query.userId && query.token) {
      const response = await changePassword({
        variables: {
          userId: query.userId as string,
          token: query.token as string,
          changePasswordInput: values,
        },
      });

      if (response.data?.changePassword.errors) {
        const fieldErrors = mapFieldErrors(response.data.changePassword.errors);
        if ('token' in fieldErrors) {
          setTokenError(fieldErrors.token);
        }
        setErrors(fieldErrors);
      }
    }
  };
  return (
    <Wrapper>
      <Formik initialValues={initialValues} onSubmit={onChangePasswordSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              placeholder="New Password"
              label="New Password"
              type="password"
            />
            {tokenError && (
              <>
                <Flex>
                  <Box color="red" mr={2}>
                    {tokenError}
                  </Box>
                </Flex>
                <Flex>
                  <NextLink href="/forgot-password">
                    <Link>Go back to Forgot Password</Link>
                  </NextLink>
                </Flex>
              </>
            )}
            <Button type="submit" colorScheme="teal" mt={4} isLoading={isSubmitting}>
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default ChangePassword;
