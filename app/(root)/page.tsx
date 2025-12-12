import { Avatar } from "@/components/avatar";
import TextToSignPlayer from "@/components/bsk";
import { TextInput } from "@/components/text-input";

export default function Home() {
  return (
    <main
      className="flex justify-center items-center lg:ml-10 lg:mr-9 mx-4"
    >
      <div className="flex flex-col gap-4">
      <Avatar />
      <TextInput />
      </div>
      {/* <TextToSignPlayer /> */}
    </main>
  );
}
