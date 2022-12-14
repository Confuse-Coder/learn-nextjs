import { Box, Button, Flex, Link, Spinner, Alert, AlertIcon, AlertTitle } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import { useState } from 'react';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import {
  ChangePasswordInput,
  MeDocument,
  MeQuery,
  useChangePasswordMutation,
} from '../generated/graphql';
import { mapFieldErrors } from '../helpers/mapFieldErrors';
import NextLink from 'next/link';
import { useCheckAuth } from '../utils/useCheckAuth';
import { useRouter } from 'next/router';

const ChangePassword = () => {
  const { data: authData, loading: authLoading } = useCheckAuth();

  const router = useRouter();

  const initialValues = { newPassword: '' };

  const [changePassword, _] = useChangePasswordMutation();

  const [tokenError, setTokenError] = useState('');

  const onChangePasswordSubmit = async (
    values: ChangePasswordInput,
    { setErrors }: FormikHelpers<ChangePasswordInput>
  ) => {
    if (router.query.userId && router.query.token) {
      const response = await changePassword({
        variables: {
          userId: router.query.userId as string,
          token: router.query.token as string,
          changePasswordInput: values,
        },
        update(cache, { data }) {
          if (data?.changePassword.success) {
            cache.writeQuery<MeQuery>({
              query: MeDocument,
              data: { me: data.changePassword.user },
            });
          }
        },
      });

      if (response.data?.changePassword.errors) {
        const fieldErrors = mapFieldErrors(response.data.changePassword.errors);
        if ('token' in fieldErrors) {
          setTokenError(fieldErrors.token);
        }
        setErrors(fieldErrors);
      } else if (response.data?.changePassword?.user) {
        router.push('/');
      }
    }
  };

  if (authLoading || (!authLoading && authData?.me)) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="100vh">
        <Spinner />
      </Flex>
    );
  } else if (!router.query.token || !router.query.userId) {
    return (
      <Wrapper size="small">
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Invalid password change request</AlertTitle>
        </Alert>

        <Flex mt={2}>
          <NextLink href="/login">
            <Link ml="auto">Back to Login</Link>
          </NextLink>
        </Flex>
      </Wrapper>
    );
  } else
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
