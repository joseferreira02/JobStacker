import { redirect } from "next/navigation";

export default function Home() {
  redirect("/home/applications");
    return <div>Home page</div>;

}