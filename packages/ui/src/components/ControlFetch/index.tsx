import type { UrlString } from "@inrupt/solid-client";
import { App, Button, Form } from "antd";
import type { MouseEventHandler, ReactElement } from "react";
import { useIdentity } from "../../contexts/IdentityContext";

interface ControlFetchProps {
  resource: UrlString;
  method: RequestInit["method"];
}

export function ControlFetch({
  resource,
  method,
}: ControlFetchProps): ReactElement {
  const form = Form.useFormInstance();
  const { session } = useIdentity();
  const { message } = App.useApp();

  const onClick: MouseEventHandler<HTMLElement> = () => {
    if (method === "GET") {
      session
        .fetch(resource, {
          method,
          headers: {
            Accept: "text/turtle",
          },
        })
        .then((response) => {
          if (response.status >= 400) {
            throw new Error(response.statusText || "An error occurred.");
          }

          response
            .text()
            .then((text) => {
              form.setFieldsValue({ field: text });
            })
            .catch(() => {
              void message.open({
                type: "error",
                content: "Colud not prase response.",
              });
            });
        })
        .catch((error: Error) => {
          void message.open({
            type: "error",
            content: error.toString(),
          });
        });
    }

    if (method === "PUT") {
      session
        .fetch(resource, {
          method,
          body: String(form.getFieldValue("field")),
          headers: {
            "Content-Type": "text/turtle",
          },
        })
        .then((response) => {
          if (response.status >= 400) {
            throw new Error(response.statusText || "An error occurred.");
          }
        })
        .catch((error: Error) => {
          void message.open({
            type: "error",
            content: error.toString(),
          });
        });
    }
  };

  return <Button onClick={onClick}>{method}</Button>;
}
