import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PlaybookBuilderPage() {
  const [playbooks, setPlaybooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaybooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "playbookDrafts"));
        const results = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPlaybooks(results);
      } catch (err) {
        console.error("Error loading playbook drafts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaybooks();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-muted-foreground">
        <Loader className="animate-spin w-4 h-4" /> Loading playbooks...
      </div>
    );
  }

  return (
    <div className="p-6 grid gap-4">
      <h1 className="text-2xl font-semibold">Playbook Drafts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {playbooks.map((playbook) => (
          <Card
            key={playbook.id}
            className="cursor-pointer hover:shadow-md transition"
            onClick={() => navigate(`/playbook-draft/${playbook.id}`)}
          >
            <CardContent className="p-4">
              <div className="text-lg font-medium mb-1">{playbook.title || "Untitled Playbook"}</div>
              <div className="text-sm text-muted-foreground mb-2">
                {playbook.use_case_title || "Unknown Use Case"}
              </div>
              <Badge variant="secondary">{playbook.status || "Draft"}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
