import type { Sequence } from "../sequence";
import { Action } from "../sequence";

export function toTestPlan(sequence: Sequence[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.6.3">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="Test Plan">
      <boolProp name="TestPlan.tearDown_on_shutdown">true</boolProp>
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments" guiclass="ArgumentsPanel" testclass="Arguments" testname="User Defined Variables">
        <collectionProp name="Arguments.arguments"/>
      </elementProp>
    </TestPlan>
    <hashTree>
      <Arguments guiclass="ArgumentsPanel" testclass="Arguments" testname="User Defined Variables">
        <collectionProp name="Arguments.arguments">
          <elementProp name="contentType" elementType="Argument">
            <stringProp name="Argument.name">contentType</stringProp>
            <stringProp name="Argument.value">text/turtle</stringProp>
            <stringProp name="Argument.metadata">=</stringProp>
          </elementProp>
          <elementProp name="protocol" elementType="Argument">
            <stringProp name="Argument.name">protocol</stringProp>
            <stringProp name="Argument.value">http</stringProp>
            <stringProp name="Argument.metadata">=</stringProp>
          </elementProp>
          <elementProp name="server" elementType="Argument">
            <stringProp name="Argument.name">server</stringProp>
            <stringProp name="Argument.value">proxy.localhost</stringProp>
            <stringProp name="Argument.metadata">=</stringProp>
          </elementProp>
          <elementProp name="port" elementType="Argument">
            <stringProp name="Argument.name">port</stringProp>
            <stringProp name="Argument.value">4000</stringProp>
            <stringProp name="Argument.metadata">=</stringProp>
          </elementProp>
          <elementProp name="body" elementType="Argument">
            <stringProp name="Argument.name">body</stringProp>
            <stringProp name="Argument.value">&lt;ex:s&gt; &lt;ex:p&gt; &lt;ex:o&gt;.</stringProp>
            <stringProp name="Argument.metadata">=</stringProp>
          </elementProp>
        </collectionProp>
      </Arguments>
      <hashTree/>
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="Thread Group">
        <stringProp name="ThreadGroup.num_threads">\${__P(threads)}</stringProp>
        <intProp name="ThreadGroup.ramp_time">1</intProp>
        <boolProp name="ThreadGroup.same_user_on_next_iteration">false</boolProp>
        <stringProp name="ThreadGroup.on_sample_error">continue</stringProp>
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController" guiclass="LoopControlPanel" testclass="LoopController" testname="Loop Controller">
          <stringProp name="LoopController.loops">\${__P(loops)}</stringProp>
          <boolProp name="LoopController.continue_forever">false</boolProp>
        </elementProp>
      </ThreadGroup>
      <hashTree>
        <LoopController guiclass="LoopControlPanel" testclass="LoopController" testname="Loop Controller">
          <stringProp name="LoopController.loops">1</stringProp>
        </LoopController>
        <hashTree>
          <CounterConfig guiclass="CounterConfigGui" testclass="CounterConfig" testname="Counter">
            <stringProp name="CounterConfig.start">1</stringProp>
            <stringProp name="CounterConfig.end"></stringProp>
            <stringProp name="CounterConfig.incr">1</stringProp>
            <stringProp name="CounterConfig.name">loopCount</stringProp>
            <stringProp name="CounterConfig.format"></stringProp>
            <boolProp name="CounterConfig.per_user">true</boolProp>
          </CounterConfig>
          <hashTree/>
          ${toHTTPSamplerProxy(sequence)}
        </hashTree>
      </hashTree>
    </hashTree>
  </hashTree>
</jmeterTestPlan>`;
}

function toMethod(action: Action): RequestInit["method"] {
  const methods: Record<string, RequestInit["method"]> = {
    [String(Action.Create).charAt(0).toLocaleLowerCase()]: "PUT",
    [String(Action.Read).charAt(0).toLocaleLowerCase()]: "GET",
    [String(Action.Update).charAt(0).toLocaleLowerCase()]: "PUT",
    [String(Action.Delete).charAt(0).toLocaleLowerCase()]: "DELETE",
  };
  return methods[String(action).charAt(0).toLocaleLowerCase()];
}

export function toHTTPSamplerProxy(sequence: Sequence[]): string {
  const transformSequence = (action: Sequence): string => {
    return `<HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="${action.value} ${action.resource}">
          <stringProp name="HTTPSampler.domain">\${server}</stringProp>
          <stringProp name="HTTPSampler.port">\${port}</stringProp>
          <stringProp name="HTTPSampler.protocol">\${protocol}</stringProp>
          <stringProp name="HTTPSampler.contentEncoding">utf-8</stringProp>
          <stringProp name="HTTPSampler.path">/\${__P(client100Name)}/run\${__P(runId)}_thread\${__threadNum}_loop\${loopCount}_resource${action.resource}</stringProp>
          <boolProp name="HTTPSampler.follow_redirects">true</boolProp>
          <stringProp name="HTTPSampler.method">${toMethod(action.value)}</stringProp>
          <boolProp name="HTTPSampler.use_keepalive">true</boolProp>
          <boolProp name="HTTPSampler.postBodyRaw">true</boolProp>
          <elementProp name="HTTPsampler.Arguments" elementType="Arguments">
            <collectionProp name="Arguments.arguments">
              <elementProp name="" elementType="HTTPArgument">
                <boolProp name="HTTPArgument.always_encode">false</boolProp>
                <stringProp name="Argument.value">\${body}</stringProp>
                <stringProp name="Argument.metadata">=</stringProp>
              </elementProp>
            </collectionProp>
          </elementProp>
        </HTTPSamplerProxy>
        <hashTree>
          <HeaderManager guiclass="HeaderPanel" testclass="HeaderManager" testname="HTTP Header Manager">
            <collectionProp name="HeaderManager.headers">
              <elementProp name="" elementType="Header">
                <stringProp name="Header.name">Authorization</stringProp>
                <stringProp name="Header.value">\${__P(client100TokenType)} \${__P(client100AccessToken)}</stringProp>
              </elementProp>
              <elementProp name="" elementType="Header">
                <stringProp name="Header.name">User-Agent</stringProp>
                <stringProp name="Header.value">ApacheJMeter</stringProp>
              </elementProp>
              <elementProp name="" elementType="Header">
                <stringProp name="Header.name">Content-Type</stringProp>
                <stringProp name="Header.value">\${contentType}</stringProp>
              </elementProp>
              <elementProp name="" elementType="Header">
                <stringProp name="Header.name">X-Proxy-Bypass-Token</stringProp>
                <stringProp name="Header.value">\${__P(proxyBypassToken)}</stringProp>
              </elementProp>
            </collectionProp>
          </HeaderManager>
          <hashTree/>
        </hashTree>`;
  };

  return sequence.map(transformSequence).join("\n");
}
