import { useQuery } from "@tanstack/react-query";
import { getUsersApi } from "../../services/authService";

export default function useUsers() {
  // const { data, isLoading } = useQuery({
  //   queryKey: ["users"],
  //   queryFn: getUsersApi,
  // });

  // const { users } = data || {};
  const isLoading = false
  const users={}

  return { isLoading, users };
}
