import Image from "next/image"

const Welcome = () => {
  return (
    <main className="flex justify-center items-center min-h-screen">
      <div>
        <Image src={"/logo.svg"} alt="logo" width={90} height={90} />
      </div>
    </main>
  )
}

export default Welcome