import { APPS } from "../_shared/apps-data";

export const onRequestGet: PagesFunction = async () => {
  return Response.json(
    {
      apps: APPS,
      disclaimer:
        "본 예상 수익 정보는 실제 검증되지 않은 예시(샘플) 데이터입니다. 실제 리워드는 앱 정책 및 시점에 따라 달라질 수 있습니다.",
    },
    { headers: { "Cache-Control": "public, max-age=300", "Access-Control-Allow-Origin": "*" } }
  );
};
