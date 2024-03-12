export interface Registration {
  application_type: string;
  grant_types: string[];
  id_token_signed_response_alg: string;
  require_auth_time: boolean;
  response_types: string[];
  subject_type: string;
  token_endpoint_auth_method: string;
  post_logout_redirect_uris: string[];
  require_pushed_authorization_requests: boolean;
  dpop_bound_access_tokens: boolean;
  client_id_issued_at: number;
  client_id: string;
  client_name: string;
  client_secret_expires_at: number;
  client_secret: string;
  redirect_uris: string[];
  registration_client_uri: string;
  registration_access_token: string;
}

type ClientId = string;

export const registrationStore = new Map<ClientId, Registration>();
