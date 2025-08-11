import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientPlaybooksPage() {
  const { clientId } = useParams();
  const [playbooks, setPlaybooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaybooks = async () => {
      try {
        const q = query(
          collection(db, "clientPlaybooks"),
          where("clientId", "==", Number(clientId))
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPlaybooks(data);
      } catch (err) {
        console.error("Error loading client playbooks:", err);
        setPlaybooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaybooks();
  }, [clientId]);

  if (loading) return <Skeleton className="w-full h-40" />;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Client Playbooks (Client ID: {clientId})</h1>

      {playbooks.length === 0 ? (
        <p className="text-muted-foreground">No playbooks have been sent to this client yet.</p>
      ) : (
        <div className="grid gap-4">
          {playbooks.map((pb) => (
            <Card key={pb.id}>
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-1">{pb.title}</h2>
                <p className="text-sm text-muted-foreground mb-2">{pb.sentAt?.toDate().toLocaleString() || "N/A"}</p>
                <Link
                  to={`/playbook-draft/${pb.draftId}`}
                  className="text-blue-600 underline text-sm"
                >
                  View Playbook
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
