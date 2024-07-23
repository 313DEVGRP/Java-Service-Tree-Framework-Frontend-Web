import { useState, useEffect, useCallback } from "react";
import ControlPanel from "./ControlPanel.jsx";
import Canvas from "../EditorCanvas/Canvas.jsx";
import { CanvasContextProvider } from "../../context/CanvasContext.jsx";
import SidePanel from "../EditorSidePanel/SidePanel.jsx";
import { DB, State } from "../../data/constants.js";
import { db } from "../../data/db.js";
import axios from "axios";
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

  // 1. query string setup
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
      Toast.success('URL parameters are valid');
    } else {
      Toast.error('One or more required parameters are missing');
      // console.warn('One or more required parameters are missing');
      return;
    }
  }, []);

  // 3. API 호출 및 상태 설정 함수
  const fetchData = async () => {
    try {
      const ARMS_REQADD_ENDPOINT = '/auth-user/api/arms/reqAdd/T_ARMS_REQADD_' + pdServiceId;
      const ARMS_PRODUCT_ENDPOINT = '/auth-user/api/arms/pdServicePure/getNode.do?c_id=' + pdServiceId;
      let response;
      if (armsType === 'reqadd') {
        if (armsMode === 'update' || armsMode === 'view' || armsMode === 'create') {
          response = await axios.get(ARMS_REQADD_ENDPOINT);
          Toast.success("Workspace reqadd loaded!");
        }
      } else if (armsType === 'product') {
        response = await axios.get(ARMS_PRODUCT_ENDPOINT);
        Toast.success("Workspace product loaded!");
      } else {
        Toast.error('armsType is not valid');
        return;
      }

      // API 응답 데이터를 상태에 설정
      if (response) {
        // setTables(response.data.tables);
        // setRelationships(response.data.relationships);
        console.log(response);
        // 추가로 필요한 상태 업데이트 로직을 여기에 추가
      }
    } catch (err) {
      Toast.error(err);
    }
  };

  // 4. useEffect를 사용하여 fetchData 함수 호출
  useEffect(() => {
    if (armsValidate) {
      Toast.success('armsValidate is true');
      fetchData();
    }
  }, [armsValidate]); // armsValidate가 true로 설정된 경우에만 fetchData 호출
  // deps 인자는 해당 값이 바뀌면 이 useEffect가 실행 되도록 설정. 계속 실행된단얘기임.



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
      if (
        (id === 0 && window.name === "") ||
        window.name.split(" ")[0] === "lt"
      ) {
        if (armsValidate) {
          await db.armsDiagrams
            .add({
              id: armsId,
              armsId: armsId,
              armsType: armsType,
              pdServiceId: pdServiceId,
              armsValidate: armsValidate,
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
              ...(databases[database].hasTypes && { types: types }),
            })
            .then((id) => {
              setId(id);
              window.name = `d ${id}`;
              setSaveState(State.SAVED);
              setLastSaved(new Date().toLocaleString());
            });
        } else {
          alert("[A-RMS] :: [Workspace.jsx] :: A-RMS를 통해 접근한 케이스에 한해서 저장이 가능합니다. 125");
        }
      } else {
        if (armsValidate) {
          await db.armsDiagrams
            .update(id, {
              armsId: armsId,
              armsType: armsType,
              pdServiceId: pdServiceId,
              armsValidate: armsValidate,
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
              ...(databases[database].hasTypes && { types: types }),
            })
            .then(() => {
              setSaveState(State.SAVED);
              setLastSaved(new Date().toLocaleString());
            });
        } else {
          alert("[A-RMS] :: [Workspace.jsx] :: A-RMS를 통해 접근한 케이스에 한해서 저장이 가능합니다. 125");
        }
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
          ...(databases[database].hasTypes && { types: types }),
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
    enums,
  ]);

  const load = useCallback(async () => {
    const loadLatestDiagram = async () => {
      await db.armsDiagrams
        .orderBy("lastModified")
        .last()
        .then((d) => {
          if (d) {
            if (d.database) {
              setDatabase(d.database);
            } else {
              setDatabase(DB.GENERIC);
            }
            setId(d.id);
            setTitle(d.name);
            setTables(d.tables);
            setRelationships(d.references);
            setNotes(d.notes);
            setAreas(d.areas);
            setTasks(d.todos ?? []);
            setTransform({ pan: d.pan, zoom: d.zoom });
            if (databases[database].hasTypes) {
              setTypes(d.types ?? []);
            }
            if (databases[database].hasEnums) {
              setEnums(d.enums ?? []);
            }
            window.name = `d ${d.id}`;
          } else {
            window.name = "";
            if (selectedDb === "") setShowSelectDbModal(true);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    };

    const loadDiagram = async (id) => {
      await db.armsDiagrams
        .get(id)
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
              zoom: diagram.zoom,
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
          }
        })
        .catch((error) => {
          console.log(error);
        });
    };

    const loadTemplate = async (id) => {
      await db.templates
        .get(id)
        .then((diagram) => {
          if (diagram) {
            if (diagram.database) {
              setDatabase(diagram.database);
            } else {
              setDatabase(DB.GENERIC);
            }
            setId(diagram.id);
            setTitle(diagram.title);
            setTables(diagram.tables);
            setRelationships(diagram.relationships);
            setAreas(diagram.subjectAreas);
            setTasks(diagram.todos ?? []);
            setNotes(diagram.notes);
            setTransform({
              zoom: 1,
              pan: { x: 0, y: 0 },
            });
            setUndoStack([]);
            setRedoStack([]);
            if (databases[database].hasTypes) {
              setTypes(diagram.types ?? []);
            }
            if (databases[database].hasEnums) {
              setEnums(diagram.enums ?? []);
            }
          } else {
            if (selectedDb === "") setShowSelectDbModal(true);
          }
        })
        .catch((error) => {
          console.log(error);
          if (selectedDb === "") setShowSelectDbModal(true);
        });
    };

    if (window.name === "") {
      loadLatestDiagram();
    } else {
      const name = window.name.split(" ");
      const op = name[0];
      const id = parseInt(name[1]);
      switch (op) {
        case "d": {
          loadDiagram(id);
          break;
        }
        case "t":
        case "lt": {
          loadTemplate(id);
          break;
        }
        default:
          break;
      }
    }
  }, [
    setTransform,
    setRedoStack,
    setUndoStack,
    setRelationships,
    setTables,
    setAreas,
    setNotes,
    setTypes,
    setTasks,
    setDatabase,
    database,
    setEnums,
    selectedDb,
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

  useEffect(() => {
    document.title = "Editor | drawDB";

    load();
  }, [load]);

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
