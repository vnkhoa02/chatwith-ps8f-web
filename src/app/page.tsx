import OauthAuth from "@/components/Login/OauthAuth";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { code, state } = await searchParams;
  return (
    <main>
      {code && state && <OauthAuth code={code} state={state} />}
      <h1>Welcome to the Home Page</h1>
    </main>
  );
}
