# app/routers/ambientes.py
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from fastapi.encoders import jsonable_encoder

from app.db import get_session

print("🛠️  [ambientes.py] módulo carregado")
router = APIRouter(prefix="/reports/ambientes", tags=["Ambientes"])

class Params(BaseModel):
    clientid: Optional[int] = None
    active: Optional[bool] = None
    applicationtype: Optional[str] = None

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
async def list_ambientes(params: Params, session: AsyncSession = Depends(get_session)):
    clauses, q = ["1=1"], {}
    if params.active is not None:
        clauses.append("c.active = :active")
        q["active"] = params.active
    if params.clientid is not None:
        clauses.append("cl.clientid = :clientid")
        q["clientid"] = params.clientid
    if params.applicationtype:
        clauses.append(f"{NORM} = :applicationtype")
        q["applicationtype"] = params.applicationtype

    sql = f"""
    SELECT
      c.companyid,
      c.shortname       AS environment_short,
      c.fullname        AS environment_full,
      c.created         AS created_at,
      c.active          AS environment_active,
      cl.clientid,
      cl.name           AS client_name,
      a.applicationid,
      {NORM}            AS normalized_app_type
    FROM "default".tblcompany c
    LEFT JOIN "default".tblclientenv     ce ON ce.companyid = c.companyid
    LEFT JOIN "default".tblclient        cl ON cl.clientid  = ce.clientid
    LEFT JOIN "default".tblenvironmentapp ea ON ea.companyid = c.companyid
    LEFT JOIN "default".tblapplication   a  ON a.applicationid = ea.applicationid
    WHERE {' AND '.join(clauses)}
    ORDER BY c.companyid;
    """
    result = await session.execute(text(sql), q)
    rows = result.mappings().all()
    return JSONResponse(content=jsonable_encoder(rows))