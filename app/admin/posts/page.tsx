import { redirect } from "next/navigation";

// 글 목록은 /admin으로 옮겼다. 예전 주소로 들어와도 그쪽으로 보낸다.
export default function AdminPostsRedirect() {
  redirect("/admin");
}
