import { Maintab, Profiletab } from "./_component/Tabs";

export default function Home() {
  const profileData = {
    totalCount: 10,
    votedCount: 5,
    writtenCount: 7,
  };

  return (
    <main>
      <Maintab />
      <Profiletab {...profileData} />
    </main>
  );
}
