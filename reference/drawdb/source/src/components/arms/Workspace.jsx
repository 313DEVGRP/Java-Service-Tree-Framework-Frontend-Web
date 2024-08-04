import { useState, useEffect, useCallback } from "react";
import ControlPanel from "./ControlPanel.jsx";
import Canvas from "../EditorCanvas/Canvas.jsx";
import { CanvasContextProvider } from "../../context/CanvasContext.jsx";
import SidePanel from "../EditorSidePanel/SidePanel.jsx";
import { DB, State } from "../../data/constants.js";
import { db } from "../../data/db.js";
import axios from "axios";
import { toPng } from "html-to-image";
import html2canvas from 'html2canvas';
import {
  useLayout,
  useSettings,
  useTransform,
  useDiagram,
  useUndoRedo,
  useAreas,
  useNotes,
  useTypes,
  useTasks,
  useSaveState,
  useEnums,
} from "../../hooks/index.js";
import FloatingControls from "../FloatingControls.jsx";
import { Modal, Toast } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { databases } from "../../data/databases.js";

export default function WorkSpace() {
  const [id, setId] = useState(""); // ex) req-10 product-15 -> armsType + armsId
  const [armsId, setArmsId] = useState(0);
  const [armsType, setArmsType] = useState(""); // ex) product, reqadd
  const [armsMode, setArmsMode] = useState(""); // ex) view, create, update
  const [pdServiceId, setPdServiceId] = useState(0);
  const [armsValidate, setArmsValidate] = useState(false); // 위 3가지 값이 존재할 경우에만 true
  const [title, setTitle] = useState("Untitled Diagram");
  const [resize, setResize] = useState(false);
  const [width, setWidth] = useState(340);
  const [lastSaved, setLastSaved] = useState("");
  const [showSelectDbModal, setShowSelectDbModal] = useState(false);
  const [selectedDb, setSelectedDb] = useState("");
  const { layout } = useLayout();
  const { settings } = useSettings();
  const { types, setTypes } = useTypes();
  const { areas, setAreas } = useAreas();
  const { tasks, setTasks } = useTasks();
  const { notes, setNotes } = useNotes();
  const { saveState, setSaveState } = useSaveState();
  const { transform, setTransform } = useTransform();
  const { enums, setEnums } = useEnums();
  const {
    tables,
    relationships,
    setTables,
    setRelationships,
    database,
    setDatabase,
  } = useDiagram();
  const { undoStack, redoStack, setUndoStack, setRedoStack } = useUndoRedo();
  const { t } = useTranslation();



  // Blob 데이터를 Base64 문자열로 변환하는 함수
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const generatePngData = async () => {
    const canvasElement = document.getElementById("canvas");
    if (!canvasElement) {
      console.error("Canvas element not found");
      return;
    }

    try {
      // const canvas = await html2canvas(canvasElement);

      // const dataUrl = canvas.toDataURL('image/webp', 100);

      const dataUrl = await toPng(canvasElement);

      const blob = dataURItoBlob(dataUrl);

      const base64Data = await blobToBase64(blob);

      return base64Data;
    } catch (error) {
      console.error("Error generating PNG data:", error);
      throw error;
    }
  };

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let paramArmsId = urlParams.get("armsId");
    let paramArmsType = urlParams.get("armsType");
    let paramPdServiceId = urlParams.get("pdServiceId");
    let paramArmsMode = urlParams.get("armsMode");
    console.log("[A-RMS] :: URL param :: armsId :: " + paramArmsId);
    console.log("[A-RMS] :: URL param :: armsType :: " + paramArmsType);
    console.log("[A-RMS] :: URL param :: pdServiceId :: " + paramPdServiceId);
    console.log("[A-RMS] :: URL param :: armsMode :: " + paramArmsMode);
    if (paramArmsId && paramArmsType && paramPdServiceId && paramArmsMode) {
      setArmsId(Number(paramArmsId));
      setPdServiceId(Number(paramPdServiceId));
      setArmsType(paramArmsType);
      setArmsMode(paramArmsMode);
      setArmsValidate(true);
      Toast.success('Step 1 : Parameters Are Valid');
    } else {
      Toast.error('Step 1 : One or more required parameters are missing');
      return;
    }
  }, []);

  const fetchData = async () => {
    Toast.success("Step 3 : fetchData function is called");
    if (armsType === "reqadd") {
      if (armsMode === "create") {
        const tempId = "create-" + armsType + "-" + armsId;
        Toast.success("Step 4 : armsMode is valid :: " + tempId);
        await db.armsDiagrams
          .get(tempId)
          .then((diagram) => {
            if (diagram) {
              if (diagram.database) {
                setDatabase(diagram.database);
              } else {
                setDatabase(DB.GENERIC);
              }
              setId(diagram.id);
              setTitle(diagram.name);
              setTables(diagram.tables);
              setRelationships(diagram.references);
              setAreas(diagram.areas);
              setNotes(diagram.notes);
              setTasks(diagram.todos ?? []);
              setTransform({
                pan: diagram.pan,
                zoom: diagram.zoom
              });
              setUndoStack([]);
              setRedoStack([]);
              if (databases[database].hasTypes) {
                setTypes(diagram.types ?? []);
              }
              if (databases[database].hasEnums) {
                setEnums(diagram.enums ?? []);
              }
              window.name = `d ${diagram.id}`;
            } else {
              window.name = "";
              if (selectedDb === "") setShowSelectDbModal(true);
            }
          })
          .catch((error) => {
            setShowSelectDbModal(true);
            console.log(error);
          });
      } else if (armsMode === "update" || armsMode === "view") {
        Toast.success("Step 4 : armsMode is valid");
        const ARMS_REQADD_ENDPOINT = "/auth-user/api/arms/reqAddPure/T_ARMS_REQADD_" + pdServiceId + "/getNode.do?c_id=" + armsId;
        await axios.get(ARMS_REQADD_ENDPOINT)
          .then((response) => {
            Toast.success("Step 5 :: drawDB 조회 완료");
            const c_drawdb_contents = response.data.c_drawdb_contents;

            if (c_drawdb_contents) {
              const armsDiagram = JSON.parse(c_drawdb_contents);

              if (armsDiagram) {
                if (armsDiagram.database) {
                  setDatabase(armsDiagram.database);
                } else {
                  setDatabase(DB.GENERIC);
                }
                setId(armsDiagram.id);
                setTitle(armsDiagram.name);
                setTables(armsDiagram.tables);
                setRelationships(armsDiagram.references);
                setNotes(armsDiagram.notes);
                setAreas(armsDiagram.areas);
                setTasks(armsDiagram.todos ?? []);
                setTransform({ pan: armsDiagram.pan, zoom: armsDiagram.zoom });
                if (databases[database].hasTypes) {
                  setTypes(armsDiagram.types ?? []);
                }
                if (databases[database].hasEnums) {
                  setEnums(armsDiagram.enums ?? []);
                }
                window.name = `d ${armsDiagram.id}`;
              } else {
                window.name = "";
                if (selectedDb === "") setShowSelectDbModal(true);
              }
            } else {
              Toast.success("[A-RMS] :: drawDB 데이터가 없습니다.");
            }
          })
          .catch((error) => {
            Toast.error("Step 5 :: drawDB 조회 실패");
            console.log(error);
          });

      } else {
        Toast.error("Step 4 : armsMode is not valid");
        return;
      }
    } else {
      Toast.error("Step 3 : fetchData function is called");
      return;
    }
  };

  useEffect(() => {
    if (armsValidate) {
      document.title = "Editor | drawDB";
      Toast.success('Step 2 : Validation successful! Please proceed.');
      fetchData();
    }
  }, [armsValidate]);

  const handleResize = (e) => {
    if (!resize) return;
    const w = e.clientX;
    if (w > 340) setWidth(w);
  };

  const save = useCallback(async () => {
    const name = window.name.split(" ");
    const op = name[0];
    const saveAsDiagram = window.name === "" || op === "d" || op === "lt";
    if (saveAsDiagram) {
      if (armsMode === "create" && armsValidate) {
        const base64RawData = await generatePngData();
        if ((id === "" && window.name === "") || window.name.split(" ")[0] === "lt") {
          const tempId = "create-" + armsType + "-" + armsId;
          setId(tempId);
          await db.armsDiagrams
            .add({
              id: tempId,
              armsId: armsId,
              armsType: armsType,
              armsMode: armsMode,
              pdServiceId: pdServiceId,
              armsValidate: armsValidate,
              armsThumbnail: base64RawData,
              database: database,
              name: title,
              lastModified: new Date(),
              tables: tables,
              references: relationships,
              notes: notes,
              areas: areas,
              todos: tasks,
              pan: transform.pan,
              zoom: transform.zoom,
              ...(databases[database].hasEnums && { enums: enums }),
              ...(databases[database].hasTypes && { types: types })
            })
            .then(async (id) => {
              Toast.success("[A-RMS] :: 저장 완료");
              setId(id);
              window.name = `d ${id}`;
              setSaveState(State.SAVED);
              setLastSaved(new Date().toLocaleString());
              if (window.opener && !window.opener.closed) {
                window.opener.changeBtnText("#btn_modal_req_add_drawdb", "drawdb 등록 완료");
                window.opener.changeBtnText("#modal_req_add_drawdb_time", new Date().toLocaleTimeString("ko-KR"));
                window.opener.setDrawdbImage(id, base64RawData, "create");
              }
            });
        } else {
          await db.armsDiagrams
            .update(id, {
              armsId: armsId,
              armsType: armsType,
              armsMode: armsMode,
              pdServiceId: pdServiceId,
              armsValidate: armsValidate,
              armsThumbnail: base64RawData,
              database: database,
              name: title,
              lastModified: new Date(),
              tables: tables,
              references: relationships,
              notes: notes,
              areas: areas,
              todos: tasks,
              pan: transform.pan,
              zoom: transform.zoom,
              ...(databases[database].hasEnums && { enums: enums }),
              ...(databases[database].hasTypes && { types: types })
            })
            .then(async () => {
              Toast.success("[A-RMS] :: 수정 완료");
              setSaveState(State.SAVED);
              setLastSaved(new Date().toLocaleString());
              if (window.opener && !window.opener.closed) {
                window.opener.changeBtnText("#modal_req_add_drawdb_time", new Date().toLocaleTimeString("ko-KR"));
                window.opener.setDrawdbImage(id, base64RawData, "create");
              }
            });
        }
      } else if (armsMode === "update" && armsValidate) {
        const base64RawData = await generatePngData();
        const ARMS_REQADD_ENDPOINT = "/auth-user/api/arms/reqAddPure/T_ARMS_REQADD_" + pdServiceId + "/updateDrawDBContents.do";
        const body = {
          c_id: armsId,
          c_drawdb_contents: JSON.stringify({
            id: id,
            armsId: armsId,
            armsType: armsType,
            armsMode: armsMode,
            pdServiceId: pdServiceId,
            armsValidate: armsValidate,
            armsThumbnail: base64RawData,
            database: database,
            name: title,
            lastModified: new Date(),
            tables: tables,
            references: relationships,
            notes: notes,
            areas: areas,
            todos: tasks,
            pan: transform.pan,
            zoom: transform.zoom,
            ...(databases[database].hasEnums && { enums: enums }),
            ...(databases[database].hasTypes && { types: types })
          })
        };

        axios.put(ARMS_REQADD_ENDPOINT, body, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          }
        }).then((response) => {
          console.table(response);
          Toast.success("[A-RMS] :: 수정 완료");
          setSaveState(State.SAVED);
          setLastSaved(new Date().toLocaleString());
          if (window.opener && !window.opener.closed) {
            window.opener.changeBtnText("#btn_req_add_edit_drawdb", "drawdb 편집 완료");
            window.opener.changeBtnText("#req_add_edit_drawdb_time", new Date().toLocaleTimeString("ko-KR"));
            window.opener.setDrawdbImage(id, base64RawData, "update");
          }
        }).catch((error) => {
          Toast.error(error);
          console.log(error);
        });
      } else if (armsMode === "view") {
        Toast.error("[A-RMS] :: 읽기 모드에서는 저장이 불가능합니다.");
      } else {
        Toast.error("[A-RMS] :: A-RMS를 통해 접근한 케이스에 한해서 저장이 가능합니다.");
      }
    } else {
      await db.templates
        .update(id, {
          database: database,
          title: title,
          tables: tables,
          relationships: relationships,
          notes: notes,
          subjectAreas: areas,
          todos: tasks,
          pan: transform.pan,
          zoom: transform.zoom,
          ...(databases[database].hasEnums && { enums: enums }),
          ...(databases[database].hasTypes && { types: types })
        })
        .then(() => {
          setSaveState(State.SAVED);
          setLastSaved(new Date().toLocaleString());
        })
        .catch(() => {
          setSaveState(State.ERROR);
        });
    }
  }, [
    tables,
    relationships,
    notes,
    areas,
    types,
    title,
    id,
    tasks,
    transform,
    setSaveState,
    database,
    enums
  ]);

  useEffect(() => {
    if (
      tables?.length === 0 &&
      areas?.length === 0 &&
      notes?.length === 0 &&
      types?.length === 0 &&
      tasks?.length === 0
    )
      return;

    if (settings.autosave) {
      setSaveState(State.SAVING);
    }
  }, [
    undoStack,
    redoStack,
    settings.autosave,
    tables?.length,
    areas?.length,
    notes?.length,
    types?.length,
    relationships?.length,
    tasks?.length,
    transform.zoom,
    title,
    setSaveState,
  ]);

  useEffect(() => {
    if (saveState !== State.SAVING) return;

    save();
  }, [id, saveState, save]);

  return (
    <div className="h-full flex flex-col overflow-hidden theme">
      <ControlPanel
        diagramId={id}
        setDiagramId={setId}
        title={title}
        setTitle={setTitle}
        lastSaved={lastSaved}
        setLastSaved={setLastSaved}
      />
      <div
        className="flex h-full overflow-y-auto"
        onPointerUp={(e) => e.isPrimary && setResize(false)}
        onPointerLeave={(e) => e.isPrimary && setResize(false)}
        onPointerMove={(e) => e.isPrimary && handleResize(e)}
        onPointerDown={(e) => {
          // Required for onPointerLeave to trigger when a touch pointer leaves
          // https://stackoverflow.com/a/70976017/1137077
          e.target.releasePointerCapture(e.pointerId);
        }}
      >
        {layout.sidebar && (
          <SidePanel resize={resize} setResize={setResize} width={width} />
        )}
        <div className="relative w-full h-full overflow-hidden">
          <CanvasContextProvider className="h-full w-full">
            <Canvas saveState={saveState} setSaveState={setSaveState} />
          </CanvasContextProvider>
          {!(layout.sidebar || layout.toolbar || layout.header) && (
            <div className="fixed right-5 bottom-4">
              <FloatingControls />
            </div>
          )}
        </div>
      </div>
      <Modal
        centered
        size="medium"
        closable={false}
        hasCancel={false}
        title={t("pick_db")}
        okText={t("confirm")}
        visible={showSelectDbModal}
        onOk={() => {
          if (selectedDb === "") return;
          setDatabase(selectedDb);
          setShowSelectDbModal(false);
        }}
        okButtonProps={{ disabled: selectedDb === "" }}
      >
        <div className="grid grid-cols-3 gap-4 place-content-center">
          {Object.values(databases).map((x) => (
            <div
              key={x.name}
              onClick={() => setSelectedDb(x.label)}
              className={`space-y-3 py-3 px-4 rounded-md border-2 select-none ${
                settings.mode === "dark"
                  ? "bg-zinc-700 hover:bg-zinc-600"
                  : "bg-zinc-100 hover:bg-zinc-200"
              } ${selectedDb === x.label ? "border-zinc-400" : "border-transparent"}`}
            >
              <div className="font-semibold">{x.name}</div>
              {x.image && (
                <img
                  src={x.image}
                  className="h-10"
                  style={{
                    filter:
                      "opacity(0.4) drop-shadow(0 0 0 white) drop-shadow(0 0 0 white)",
                  }}
                />
              )}
              <div className="text-xs">{x.description}</div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
