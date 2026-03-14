"use client";

import { useState, useEffect, useCallback } from "react";
import { storage } from "./adapter";

export function useStorageValue<T>(
  key: string,
  fallback: T
): [T, (val: T) => void, boolean] {
  const [value, setValue] = useState<T>(fallback);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    storage.get<T>(key, fallback).then((stored) => {
      if (!cancelled) {
        setValue(stored);
        setIsLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (newValue: T) => {
      setValue(newValue);
      storage.set(key, newValue);
    },
    [key]
  );

  return [value, update, isLoaded];
}
