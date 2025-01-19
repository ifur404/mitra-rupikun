import { useEffect, useState } from "react";

export default function useUserBalance(user_id:number) {
    const [saldo, setSaldo] = useState(0);
  
    useEffect(() => {
      // You might want to guard if user_id is valid
      if (!user_id) return;
  
      // A self-invoking async function inside useEffect
      (async function getSaldo() {
        try {
          const response = await fetch(`/api/saldo/?key=${user_id}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch saldo for user ${user_id}`);
          }
          const data = await response.json() as {saldo:number};
          setSaldo(data?.saldo ?? 0);
        } catch (err: any) {
          setSaldo(0); // fallback
        } finally {
        }
      })();
    }, [user_id]);
  
    return {
      saldo,
    };
}
