import { Alert, AlertIcon, AlertTitle, Box, Flex, Heading, Spinner } from '@chakra-ui/react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import {
  PostDocument,
  PostIdsDocument,
  PostIdsQuery,
  PostQuery,
  usePostQuery,
} from '../../generated/graphql';
import { addApolloState, initializeApollo } from '../../lib/apolloClient';
import { limit } from '../index';

const Post = () => {
  const router = useRouter();
  const { data, loading, error } = usePostQuery({ variables: { id: router.query.id as string } });

  if (error || !data?.post)
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>{error ? error.message : 'Post not found!'}</AlertTitle>
      </Alert>
    );

  return (
    <Layout>
      {loading ? (
        <Flex justifyContent="center" alignItems="center" minH="100vh">
          <Spinner />
        </Flex>
      ) : (
        <>
          <Heading mb={4}>{data.post.title}</Heading>
          <Box mb={4}>{data.post.text}</Box>
        </>
      )}
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  // [
  //   { params: { id: '15'} },
  //   { params: { id: '16'} }
  // ]

  const apolloClient = initializeApollo();

  const { data } = await apolloClient.query<PostIdsQuery>({
    query: PostIdsDocument,
    variables: { limit },
  });

  return {
    paths: data.posts!.paginatedPosts.map((post) => ({
      params: { id: `${post.id}` },
    })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<{ [key: string]: any }, { id: string }> = async ({
  params,
}) => {
  const apolloClient = initializeApollo();

  await apolloClient.query<PostQuery>({
    query: PostDocument,
    variables: { id: params?.id },
  });

  return addApolloState(apolloClient, { props: {} });
};

export default Post;
