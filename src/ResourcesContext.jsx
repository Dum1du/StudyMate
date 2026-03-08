import { createContext, useContext, useState, useEffect } from "react";
import { db } from "./firebase";
import { collectionGroup, getDocs, orderBy, limit, query } from "firebase/firestore";

const ResourcesContext = createContext();

export const ResourcesProvider = ({ children }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const q = query(
          collectionGroup(db, "Materials"),
          orderBy("createdAt", "desc"),
          limit(4) // latest 4
        );
        const snapshot = await getDocs(q);
        const all = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          path: doc.ref.path
        }));
        setResources(all);
      } catch (err) {
        console.error("Error fetching resources:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  return (
    <ResourcesContext.Provider value={{ resources, loading }}>
      {children}
    </ResourcesContext.Provider>
  );
};

export const useResources = () => useContext(ResourcesContext);