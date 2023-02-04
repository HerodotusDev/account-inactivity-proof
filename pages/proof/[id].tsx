import { prisma } from "shared/db";

import Index from "pages/index";
export default Index;

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
}

export async function getStaticProps(context) {
  if (!context.params.id) return { props: {} };

  const inactivityProof = await prisma.inactivityProof.findUnique({
    where: {
      id: context.params.id,
    },
  });

  return {
    props: { inactivityProof },
    revalidate: 10,
  };
}
