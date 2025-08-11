// src/pages/UseCaseProfilePage.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import UseCaseProfile from "@/components/UseCaseProfile";

export default function UseCaseProfilePage() {
  const { id } = useParams();
  const [useCase, setUseCase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUseCase = async () => {
      try {
        const docRef = doc(db, "prioritizedUseCases", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUseCase(docSnap.data());
        } else {
          setUseCase(null);
        }
      } catch (err) {
        console.error("Error loading use case:", err);
        setUseCase(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUseCase();
  }, [id]);

  if (loading) {
    return <div className="p-6 text-gray-700">Loading use case...</div>;
  }

  if (!useCase) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-red-500">Use case not found</h2>
        <p className="text-muted-foreground">No use case found for ID: {id}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <UseCaseProfile useCase={useCase} />
    </div>
  );
}
