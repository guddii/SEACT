import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";
import type Entity from "@ant-design/cssinjs/es/Cache";
import { useServerInsertedHTML } from "next/navigation";
import type { PropsWithChildren } from "react";
import React, { useMemo, useRef } from "react";

export function StyledComponentsRegistry({
  children,
}: PropsWithChildren): React.ReactElement {
  const cache = useMemo<Entity>(() => createCache(), []);
  const isServerInserted = useRef<boolean>(false);
  useServerInsertedHTML(() => {
    // avoid duplicate css insert
    if (isServerInserted.current) {
      return;
    }
    isServerInserted.current = true;
    return (
      <style
        dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }}
        id="antd"
      />
    );
  });
  return <StyleProvider cache={cache}>{children}</StyleProvider>;
}
