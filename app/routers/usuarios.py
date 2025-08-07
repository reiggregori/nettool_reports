# app/routers/usuarios.py
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from fastapi.encoders import jsonable_encoder

from app.db import get_session

print("🛠️  [usuarios.py] módulo carregado")
router = APIRouter(prefix="/reports/usuarios", tags=["Usuários"])

class Params(BaseModel):
    clientid: Optional[int] = None
    companyid: Optional[int] = None
    applicationtype: Optional[str] = None
    active: Optional[bool] = None

NORM = """
CASE
  WHEN (a.config->>'type')::int IN (1,3) THEN 'Nettool Pro'
  WHEN (a.config->>'type')::int = 2 THEN 'MapPoint.ai'
  WHEN (a.config->>'type')::int = 4 THEN 'API Agregação'
  WHEN (a.config->>'type')::int = 5 THEN 'Smartleads'
  WHEN (a.config->>'type')::int = 6 THEN 'helpDesk'
  ELSE 'Other'
END
"""

@router.post("", response_class=JSONResponse)
async def list_usuarios(params: Params, session: AsyncSession = Depends(get_session)):
    clauses, q = ["1=1"], {}
    if params.companyid is not None:
        clauses.append("c.companyid = :companyid")
        q["companyid"] = params.companyid
    if params.clientid is not None:
        clauses.append("cl.clientid = :clientid")
        q["clientid"] = params.clientid
    if params.applicationtype:
        clauses.append(f"{NORM} = :applicationtype")
        q["applicationtype"] = params.applicationtype
    if params.active is not None:
        clauses.append("u.active = :active")
        q["active"] = params.active

    sql = f"""
    SELECT
      u.userid,
      u.fullname       AS user_name,
      u.email,
      u.active         AS user_active,
      c.companyid,
      c.shortname      AS environment_short,
      {NORM}           AS normalized_app_type,
      a.applicationid
    FROM "default".tbluser u
    LEFT JOIN "default".tbluserenvironment ue ON ue.userid = u.userid
    LEFT JOIN "default".tblcompany        c  ON c.companyid = ue.companyid
    LEFT JOIN "default".tblclientenv      ce ON ce.companyid = c.companyid
    LEFT JOIN "default".tblclient         cl ON cl.clientid = ce.clientid
    LEFT JOIN "default".tblenvironmentapp ea ON ea.companyid = c.companyid
    LEFT JOIN "default".tblapplication    a  ON a.applicationid = ea.applicationid
    WHERE {' AND '.join(clauses)}
    ORDER BY u.userid;
    """
    result = await session.execute(text(sql), q)
    rows = result.mappings().all()
    return JSONResponse(content=jsonable_encoder(rows))