"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wand2, Users, Clock, Brain, Loader2, Badge } from "lucide-react";
import { useGenerateQuestions, type Question, type GenerateQuestionsPayload } from "../hooks/useGenerateQuestions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Label, Select, Textarea } from "@headlessui/react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@radix-ui/react-checkbox";
import { printError } from "@/utils/debugLogger";

interface SessionCreatorProps {
  onBack: () => void;
  onCreateSession: (sessionData: any) => void;
}

export default function SessionCreator({ onBack, onCreateSession }: SessionCreatorProps) {
  const { generateQuestions, loading: generatingQuestions } = useGenerateQuestions();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    mode: "guided" as "guided" | "async",
    duration: 30,
    session_objective: "",
    context_description: "", // 👈 Campo para el texto del usuario
    target_stress_levels: [] as string[],
    question_types: [] as string[],
    focus_areas: [] as string[],
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [step, setStep] = useState<"basic" | "context" | "questions" | "review">("basic");

  const handleGenerateQuestions = async () => {
    if (!formData.context_description.trim()) {
      alert("Por favor, describe el contexto de las preguntas antes de generar.");
      return;
    }

    try {
      const payload: GenerateQuestionsPayload = {
        session_objective: formData.session_objective,
        context_description: formData.context_description, // 👈 Incluir el contexto
        target_stress_levels: formData.target_stress_levels,
        participant_count: participants.length || 1,
        session_duration: formData.duration,
        question_types: formData.question_types,
        focus_areas: formData.focus_areas,
      };

      const generatedQuestions = await generateQuestions(payload);
      setQuestions(generatedQuestions);
      setStep("review");
    } catch (error) {
      printError("Error generating questions:", error);
    }
  };

  const handleCreateSession = () => {
    const sessionData = {
      ...formData,
      questions,
      participants,
      created_at: new Date().toISOString(),
      status: "draft",
    };

    onCreateSession(sessionData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Dashboard
        </Button>
        <h2 className="text-2xl font-bold">Crear Nueva Sesión Biométrica</h2>
        <p className="text-gray-600">Configura una sesión de preguntas con monitoreo biométrico</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-4">
          {["basic", "context", "questions", "review"].map((stepName, index) => (
            <div key={stepName} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === stepName 
                  ? "bg-[#4a2b4a] text-white" 
                  : index < ["basic", "context", "questions", "review"].indexOf(step)
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}>
                {index + 1}
              </div>
              {index < 3 && (
                <div className={`w-12 h-1 mx-2 ${
                  index < ["basic", "context", "questions", "review"].indexOf(step)
                    ? "bg-green-500"
                    : "bg-gray-200"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {step === "basic" && (
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título de la Sesión</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Evaluación de Estrés en Sprint Planning"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duración (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  min="5"
                  max="120"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe el objetivo y contexto de esta sesión biométrica..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Modo de Sesión</Label>
              <Select value={formData.mode} onValueChange={(value: "guided" | "async") => 
                setFormData(prev => ({ ...prev, mode: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guided">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Presencial (Guiada)</p>
                        <p className="text-xs text-gray-600">Un facilitador conduce la sesión</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="async">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Asíncrona</p>
                        <p className="text-xs text-gray-600">Los participantes responden a su ritmo</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="objective">Objetivo de la Sesión</Label>
              <Textarea
                id="objective"
                value={formData.session_objective}
                onChange={(e) => setFormData(prev => ({ ...prev, session_objective: e.target.value }))}
                placeholder="Ej: Evaluar el nivel de estrés durante la planificación de sprints y identificar factores que afectan el bienestar del equipo"
                rows={3}
              />
            </div>

            <Button 
              onClick={() => setStep("context")} 
              className="w-full bg-[#4a2b4a] text-white hover:bg-[#694969]"
              disabled={!formData.title || !formData.session_objective}
            >
              Continuar a Contexto
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "context" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Contexto de las Preguntas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 👈 Campo principal para el contexto */}
            <div className="space-y-2">
              <Label htmlFor="context_description">
                Describe el contexto o tema específico para las preguntas
              </Label>
              <Textarea
                id="context_description"
                value={formData.context_description}
                onChange={(e) => setFormData(prev => ({ ...prev, context_description: e.target.value }))}
                placeholder="Ej: Las preguntas deben enfocarse en evaluar el estrés relacionado con deadlines apretados, la comunicación en equipos remotos, y la carga de trabajo durante sprints intensivos..."
                rows={4}
                className="min-h-[120px]"
              />
              <p className="text-sm text-gray-600">
                Esta descripción ayudará a la IA a generar preguntas más específicas y relevantes para tu sesión.
              </p>
            </div>

            {/* Configuración adicional */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label>Niveles de Estrés a Evaluar</Label>
                <div className="space-y-2">
                  {[
                    { value: "low", label: "Bajo" },
                    { value: "medium", label: "Medio" },
                    { value: "high", label: "Alto" }
                  ].map((level) => (
                    <div key={level.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={level.value}
                        checked={formData.target_stress_levels.includes(level.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              target_stress_levels: [...prev.target_stress_levels, level.value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              target_stress_levels: prev.target_stress_levels.filter(l => l !== level.value)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={level.value}>{level.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Tipos de Preguntas</Label>
                <div className="space-y-2">
                  {[
                    { value: "open", label: "Abiertas" },
                    { value: "scale", label: "Escala Likert" },
                    { value: "multiple_choice", label: "Opción Múltiple" }
                  ].map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={type.value}
                        checked={formData.question_types.includes(type.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              question_types: [...prev.question_types, type.value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              question_types: prev.question_types.filter(t => t !== type.value)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={type.value}>{type.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Áreas de Enfoque</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "stress", label: "Estrés" },
                  { value: "mood", label: "Estado de Ánimo" },
                  { value: "cognitive_load", label: "Carga Cognitiva" },
                  { value: "team_dynamics", label: "Dinámicas de Equipo" },
                  { value: "workload", label: "Carga de Trabajo" },
                  { value: "communication", label: "Comunicación" },
                  { value: "decision_making", label: "Toma de Decisiones" },
                  { value: "general", label: "General" }
                ].map((area) => (
                  <div key={area.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={area.value}
                      checked={formData.focus_areas.includes(area.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({
                            ...prev,
                            focus_areas: [...prev.focus_areas, area.value]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            focus_areas: prev.focus_areas.filter(a => a !== area.value)
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={area.value}>{area.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep("basic")}>
                Anterior
              </Button>
              <Button 
                onClick={() => setStep("questions")}
                className="flex-1 bg-[#4a2b4a] text-white hover:bg-[#694969]"
                disabled={!formData.context_description.trim() || formData.target_stress_levels.length === 0}
              >
                Continuar a Preguntas
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "questions" && (
        <Card>
          <CardHeader>
            <CardTitle>Generar Preguntas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Generar Preguntas con IA</h3>
                <p className="text-gray-600 mb-4">
                  Basado en tu contexto: "{formData.context_description.slice(0, 100)}..."
                </p>
                <Button 
                  onClick={handleGenerateQuestions}
                  disabled={generatingQuestions}
                  className="bg-[#4a2b4a] text-white hover:bg-[#694969]"
                  size="lg"
                >
                  {generatingQuestions ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generando Preguntas...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generar Preguntas
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Preguntas Generadas ({questions.length})</h4>
                  <Button 
                    onClick={handleGenerateQuestions}
                    disabled={generatingQuestions}
                    variant="outline"
                    size="sm"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Regenerar
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {questions.map((question, index) => (
                    <div key={question.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium">Pregunta {index + 1}</span>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            {question.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {question.category}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              question.expected_stress_level === "high" 
                                ? "border-red-300 text-red-600" 
                                : question.expected_stress_level === "medium"
                                ? "border-yellow-300 text-yellow-600"
                                : "border-green-300 text-green-600"
                            }`}
                          >
                            {question.expected_stress_level}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm">{question.question}</p>
                      {question.description && (
                        <p className="text-xs text-gray-600 mt-1">{question.description}</p>
                      )}
                      {question.type === "scale" && question.scale_labels && (
                        <div className="mt-2 text-xs text-gray-500">
                          Escala: {question.scale_labels.min} ({question.scale_min}) - {question.scale_labels.max} ({question.scale_max})
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep("context")}>
                    Anterior
                  </Button>
                  <Button 
                    onClick={() => setStep("review")}
                    className="flex-1 bg-[#4a2b4a] text-white hover:bg-[#694969]"
                  >
                    Continuar a Revisión
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === "review" && (
        <Card>
          <CardHeader>
            <CardTitle>Revisión Final</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Información de la Sesión</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Título:</strong> {formData.title}</p>
                  <p><strong>Duración:</strong> {formData.duration} minutos</p>
                  <p><strong>Modo:</strong> {formData.mode === "guided" ? "Presencial" : "Asíncrona"}</p>
                  <p><strong>Preguntas:</strong> {questions.length}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Configuración</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Niveles de estrés:</strong> {formData.target_stress_levels.join(", ")}</p>
                  <p><strong>Tipos de pregunta:</strong> {formData.question_types.join(", ")}</p>
                  <p><strong>Áreas de enfoque:</strong> {formData.focus_areas.join(", ")}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep("questions")}>
                Anterior
              </Button>
              <Button 
                onClick={handleCreateSession}
                className="flex-1 bg-[#4a2b4a] text-white hover:bg-[#694969]"
              >
                Crear Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}