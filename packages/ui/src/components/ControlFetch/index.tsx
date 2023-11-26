import type { UrlString } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { App, Button, Form } from "antd";
import { useIdentity } from "../../contexts/IdentityContext";

interface ControlFetchProps {
  ressource: UrlString;
  method: RequestInit["method"];
}

export function ControlFetch({
  ressource,
  method,
}: ControlFetchProps): React.ReactElement {
  const form = Form.useFormInstance();
  const { session } = useSession();
  const { storage } = useIdentity();
  const { message } = App.useApp();

  const onClick: React.MouseEventHandler<HTMLElement> = () => {
    if (!storage) {
      void message.open({
        type: "error",
        content: "A storage is required.",
      });
      return;
    }

    if (method === "GET") {
      session
        .fetch(ressource, {
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
              form.setFieldsValue({ "http://schema.org/name": text });
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
        .fetch(ressource, {
          method,
          body: String(form.getFieldValue("http://schema.org/name")),
          headers: {
            "Content-Type": "text/turtle",
          },
        })
        .catch((error: Error) => {
          void message.open({
            type: "error",
            content: error.toString(),
          });
        });
    }
  };

  return (
    <Button onClick={onClick} type="text">
      {method}
    </Button>
  );
}
