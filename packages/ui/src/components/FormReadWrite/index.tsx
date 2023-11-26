import { Card, Flex, Form, Input } from "antd";
import { useIdentity } from "../../contexts/IdentityContext";
import { ControlFetch } from "../ControlFetch";
import { ControlLogin } from "../ControlLogin";

const { TextArea } = Input;

const boxStyle: React.CSSProperties = {
  width: "100%",
  height: "95vh",
};

interface FormReadWriteProps {
  path: string;
}

export function FormReadWrite({
  path,
}: FormReadWriteProps): React.ReactElement {
  const { storage } = useIdentity();
  const ressource = `${storage ? storage : "/"}${path}`;
  return (
    <Form>
      <Flex align="center" justify="center" style={boxStyle}>
        <Card
          actions={[
            <ControlFetch key="get" method="GET" ressource={ressource} />,
            <ControlFetch key="put" method="PUT" ressource={ressource} />,
          ]}
          extra={<ControlLogin />}
          style={{ width: 550 }}
          title="Read and write solid pod"
        >
          <Form.Item extra={ressource} name="http://schema.org/name">
            <TextArea rows={4} />
          </Form.Item>
        </Card>
      </Flex>
    </Form>
  );
}
