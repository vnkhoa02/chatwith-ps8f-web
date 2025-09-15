import OauthAuth from "@/components/Login/OauthAuth";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { code, state } = await searchParams;
  return (
    <div>
      {code && state && <OauthAuth code={code} state={state} />}
      <h1>Hello, welcome to Chatwith-P8F!</h1>
    </div>
  );
}
